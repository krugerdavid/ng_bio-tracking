# Configuración de Apache para React Router

## Problema

Cuando refrescas la página o accedes directamente a una ruta (como `/users` o `/members`), Apache intenta buscar un archivo físico en esa ruta. Como no existe, muestra un error 404 "Not Found".

Esto ocurre porque React Router maneja las rutas del lado del cliente, pero Apache necesita saber que todas las rutas deben servir el archivo `index.html`.

## Solución

Se ha creado un archivo `.htaccess` en el directorio `public/` que se copiará automáticamente al directorio `dist/` durante el build.

### Contenido del .htaccess

El archivo `.htaccess` incluye:

1. **Rewrite Rules**: Redirige todas las rutas que no sean archivos o directorios existentes a `index.html`
2. **Compresión**: Habilita compresión gzip para mejorar el rendimiento
3. **Cache**: Configura cache para assets estáticos
4. **Security Headers**: Agrega headers de seguridad

### Verificación

Después de hacer el build, verifica que el archivo `.htaccess` esté en el directorio `dist/`:

```bash
ls -la dist/.htaccess
```

## Configuración de Apache

### Opción 1: Usar .htaccess (Recomendado)

Si tu servidor Apache tiene habilitado `mod_rewrite` y permite archivos `.htaccess`, simplemente:

1. Haz el build de la aplicación:

   ```bash
   npm run build
   ```

2. Copia el contenido de `dist/` a tu directorio web de Apache

3. Asegúrate de que el archivo `.htaccess` esté en el directorio raíz de tu aplicación

### Opción 2: Configuración en VirtualHost

Si no puedes usar `.htaccess` o prefieres configurarlo en el VirtualHost, agrega esto a tu configuración de Apache:

```apache
<VirtualHost *:443>
    ServerName ng-fitness.test
    DocumentRoot /ruta/a/tu/aplicacion/dist

    <Directory /ruta/a/tu/aplicacion/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Rewrite rules para React Router
        RewriteEngine On
        RewriteBase /

        # Don't rewrite files or directories
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d

        # Rewrite everything else to index.html
        RewriteRule ^ index.html [L]
    </Directory>
</VirtualHost>
```

### Verificar que mod_rewrite esté habilitado

Para verificar que `mod_rewrite` esté habilitado en tu servidor Apache:

```bash
# En Ubuntu/Debian
sudo a2enmod rewrite
sudo systemctl restart apache2

# Verificar que esté habilitado
apache2ctl -M | grep rewrite
```

## Pruebas

Después de configurar Apache:

1. Accede a la aplicación: `https://ng-fitness.test/`
2. Navega a diferentes rutas usando el menú (debería funcionar)
3. **Prueba crítica**: Refresca la página en cualquier ruta (por ejemplo, `/users`)
4. **Prueba crítica**: Accede directamente a una ruta escribiendo la URL (por ejemplo, `https://ng-fitness.test/members`)

Ambas pruebas deberían funcionar correctamente sin mostrar el error 404.

## Troubleshooting

### Error: "Internal Server Error"

- Verifica que `mod_rewrite` esté habilitado
- Verifica los permisos del archivo `.htaccess`
- Revisa los logs de Apache: `tail -f /var/log/apache2/error.log`

### Error: "Forbidden"

- Verifica que `AllowOverride All` esté configurado en el VirtualHost o `.htaccess`
- Verifica los permisos del directorio

### Las rutas aún no funcionan

- Verifica que el archivo `.htaccess` esté en el directorio correcto (donde está `index.html`)
- Limpia la caché del navegador
- Verifica que la configuración de Apache esté correcta

## Notas Adicionales

- El archivo `.htaccess` también incluye optimizaciones de rendimiento (compresión, cache)
- Se incluyen headers de seguridad básicos
- Esta configuración es compatible con HTTPS
