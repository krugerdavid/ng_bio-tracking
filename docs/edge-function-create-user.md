# Supabase Edge Function: create-user

Esta Edge Function permite a los administradores crear usuarios de forma segura usando el `service_role_key`.

## 📂 Ubicación

```
supabase/
└── functions/
    └── create-user/
        └── index.ts
```

## 📝 Código de la Edge Function

Crea el archivo `supabase/functions/create-user/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify caller is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify caller is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: email, password, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['admin', 'user'].includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role. Must be "admin" or "user"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create new user using Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email
    })

    if (createError) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create user: ${createError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User creation failed: No user data returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: newUser.user.id,
        email: newUser.user.email,
        role,
        created_by: user.id
      })

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create profile: ${profileError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## 🚀 Deployment

### Opción 1: Deploy desde Supabase Dashboard

1. Ve a **Edge Functions** en el dashboard de Supabase
2. Click en **Create a new function**
3. Nombre: `create-user`
4. Pega el código anterior
5. Click **Deploy**

### Opción 2: Deploy desde CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link a tu proyecto
supabase link --project-ref your-project-ref

# Deploy la función
supabase functions deploy create-user
```

## 🧪 Testing

Puedes probar la función desde la consola de Supabase o con curl:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/create-user' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123!",
    "role": "user"
  }'
```

## ⚙️ Configuración

Las Edge Functions automáticamente tienen acceso a:
- `SUPABASE_URL` - Tu URL de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - La service role key (solo en server-side)

No necesitas configurar nada adicional.

## 🔒 Seguridad

✅ **Verificación de admin** - Solo admins pueden llamar esta función
✅ **Service role key** - Nunca expuesta al frontend  
✅ **Transacción** - Si falla profile creation, se elimina el auth user
✅ **CORS** - Configurado para aceptar requests del frontend
✅ **Validación** - Email, password y role son validados

## 📚 Referencias

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Admin API Docs](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
