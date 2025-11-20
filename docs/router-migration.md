# Migración del Router a createBrowserRouter

## Cambio Realizado

Se ha migrado el router de usar `BrowserRouter` + `Routes/Route` a `createBrowserRouter` + `RouterProvider`, siguiendo el mismo patrón que `merchant-web`.

## Diferencias Clave

### Antes (BrowserRouter)

```typescript
// main.tsx
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>

// AppRouter.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<PrivateRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/" element={<MemberListPageController />} />
    </Route>
  </Route>
</Routes>
```

### Después (createBrowserRouter)

```typescript
// main.tsx
<AuthProvider>
  <App />
</AuthProvider>

// AppRouter.tsx
const routesConfig = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <MemberListPageController />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routesConfig);
return <RouterProvider router={router} />;
```

## Beneficios

1. **Mejor manejo del refresh**: `createBrowserRouter` maneja mejor el refresco de página y el routing del lado del servidor
2. **Configuración más clara**: Las rutas se definen como objetos de configuración, más fácil de mantener
3. **Consistencia**: Mismo patrón que `merchant-web`
4. **Mejor soporte para SSR**: Preparado para futuras migraciones a SSR si es necesario

## Cambios en PrivateRoute

`PrivateRoute` ahora recibe `children` como prop en lugar de usar `Outlet`:

```typescript
// Antes
export default function PrivateRoute() {
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Después
export function PrivateRoute({ children }: PrivateRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

## Compatibilidad con .htaccess

El archivo `.htaccess` sigue siendo necesario para que Apache redirija todas las rutas a `index.html`. `createBrowserRouter` mejora el manejo del routing del lado del cliente, pero el servidor aún necesita servir `index.html` para todas las rutas.

## Verificación

Después de estos cambios:

1. ✅ El build compila correctamente
2. ✅ El router funciona igual que antes
3. ✅ El refresh de página debería funcionar mejor
4. ✅ Compatible con la configuración de Apache existente
