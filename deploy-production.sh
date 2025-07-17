#!/bin/bash

# 🚀 PRODUCTION DEPLOYMENT SCRIPT
# ================================

echo "🚀 Iniciando deploy de producción..."

# 1. Build de producción
echo "📦 Generando build de producción..."
npm run build

# 2. Verificar que el build se generó correctamente
if [ ! -d "public/build" ]; then
    echo "❌ Error: No se generó el directorio public/build"
    exit 1
fi

echo "✅ Build generado correctamente"

# 3. Crear archivo de configuración de producción
echo "⚙️ Creando archivo de configuración de producción..."

cat > .env.production << 'EOF'
APP_NAME="Zenith Lineup"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database Configuration (Hostinger)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Mail Configuration (SendGrid for production)
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Session & Cache
SESSION_DRIVER=file
SESSION_LIFETIME=120
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# Security
LOG_CHANNEL=stack
LOG_LEVEL=error
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# File Storage
FILESYSTEM_DISK=local

# Broadcasting (disable for production)
BROADCAST_DRIVER=log

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_ATTEMPTS=60
RATE_LIMIT_DECAY_MINUTES=1

# Two-Factor Authentication
TWO_FACTOR_ENABLED=true
TWO_FACTOR_CODE_EXPIRY=10

# Application Specific
HABIT_REMINDER_ENABLED=true
ACHIEVEMENT_SYSTEM_ENABLED=true
ANALYTICS_ENABLED=true
EOF

echo "✅ Archivo .env.production creado"

# 4. Crear .htaccess optimizado
echo "🔧 Creando .htaccess optimizado..."

cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]

    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF

echo "✅ .htaccess optimizado creado"

# 5. Crear checklist de deploy
echo "📋 Creando checklist de deploy..."

cat > DEPLOY_CHECKLIST.md << 'EOF'
# 🚀 CHECKLIST DE DEPLOY - HOSTINGER

## ✅ PASOS A SEGUIR EN EL SERVIDOR:

### 1. Subir archivos
- [ ] Subir todos los archivos al servidor
- [ ] Asegurar que el document root apunte a `/public`

### 2. Configurar base de datos
- [ ] Crear base de datos en Hostinger
- [ ] Crear usuario de base de datos
- [ ] Actualizar credenciales en `.env`

### 3. Configurar dominio
- [ ] Actualizar `APP_URL` en `.env` con tu dominio
- [ ] Actualizar `SANCTUM_STATEFUL_DOMAINS` con tu dominio
- [ ] Habilitar SSL/HTTPS

### 4. Configurar email
- [ ] Actualizar credenciales de SendGrid en `.env`
- [ ] Verificar email remitente en SendGrid

### 5. Ejecutar comandos en el servidor
```bash
# Generar APP_KEY
php artisan key:generate

# Limpiar caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
php artisan migrate --force

# Crear enlaces simbólicos
php artisan storage:link

# Establecer permisos
chmod -R 755 storage bootstrap/cache
chmod 644 .env
```

### 6. Verificar funcionamiento
- [ ] Acceder a la aplicación
- [ ] Probar registro de usuarios
- [ ] Probar login
- [ ] Probar funcionalidades principales
- [ ] Verificar emails de 2FA

### 7. Configuraciones adicionales
- [ ] Configurar backup automático
- [ ] Configurar monitoreo
- [ ] Configurar logs de error

## ⚠️ IMPORTANTE:
- Asegúrate de que `APP_DEBUG=false` en producción
- Verifica que todos los console.logs fueron eliminados
- Confirma que el SSL está habilitado
- Verifica que los permisos de archivos son correctos
EOF

echo "✅ Checklist de deploy creado"

# 6. Crear archivo de comandos para el servidor
echo "💻 Creando archivo de comandos para el servidor..."

cat > server-commands.sh << 'EOF'
#!/bin/bash

echo "🔧 Ejecutando comandos de configuración del servidor..."

# 1. Generar APP_KEY
echo "Generando APP_KEY..."
php artisan key:generate

# 2. Limpiar caches
echo "Limpiando caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 3. Optimizar para producción
echo "Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Ejecutar migraciones
echo "Ejecutando migraciones..."
php artisan migrate --force

# 5. Crear enlaces simbólicos
echo "Creando enlaces simbólicos..."
php artisan storage:link

# 6. Establecer permisos
echo "Estableciendo permisos..."
chmod -R 755 storage bootstrap/cache
chmod 644 .env

echo "✅ Configuración del servidor completada"
echo "🚀 Tu aplicación está lista para producción!"
EOF

chmod +x server-commands.sh

echo "✅ Script de comandos del servidor creado"

# 7. Resumen final
echo ""
echo "🎉 DEPLOY PREPARADO EXITOSAMENTE!"
echo "=================================="
echo ""
echo "📁 Archivos generados:"
echo "   - .env.production (configuración de producción)"
echo "   - public/.htaccess (configuración del servidor)"
echo "   - DEPLOY_CHECKLIST.md (checklist paso a paso)"
echo "   - server-commands.sh (comandos para el servidor)"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Subir archivos a Hostinger"
echo "   2. Configurar base de datos"
echo "   3. Actualizar .env con tus credenciales"
echo "   4. Ejecutar server-commands.sh en el servidor"
echo ""
echo "🔗 Documentación completa en: production-config.md"
echo "" 