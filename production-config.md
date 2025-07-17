# 🚀 PRODUCTION DEPLOYMENT GUIDE - HOSTINGER

## 📋 **1. Variables de Entorno para Producción**

Crea un archivo `.env` en tu servidor con estas configuraciones:

```env
# ===========================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# ===========================================

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

# Redis (if available on Hostinger)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

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
```

## 🔧 **2. Comandos de Preparación para Producción**

### **En tu servidor Hostinger, ejecuta:**

```bash
# 1. Generar APP_KEY
php artisan key:generate

# 2. Limpiar y optimizar
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 3. Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Ejecutar migraciones
php artisan migrate --force

# 5. Crear enlaces simbólicos
php artisan storage:link

# 6. Establecer permisos
chmod -R 755 storage bootstrap/cache
chmod 644 .env
```

## 🏗️ **3. Configuración del Servidor**

### **Hostinger cPanel:**
1. **Subdominio o dominio principal** → apunta a `/public`
2. **PHP Version** → 8.1 o superior
3. **MySQL** → crear base de datos y usuario
4. **SSL Certificate** → habilitar HTTPS

### **Archivo .htaccess en /public:**
```apache
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
```

## 📦 **4. Build de Producción**

### **En tu máquina local, antes de subir:**

```bash
# 1. Build de producción
npm run build

# 2. Optimizar assets
npm run build -- --mode production

# 3. Verificar que se generaron los archivos en /public/build
```

## 🧹 **5. Limpieza de Console.logs**

### **Archivos a revisar y limpiar:**
- `resources/js/components/admin/AdminUsersTable.jsx`
- `resources/js/components/admin/AdminHabitsTable.jsx`
- `resources/js/components/admin/AdminLogsTable.jsx`
- `resources/js/stores/authStore.js`
- `resources/js/stores/notificationStore.js`
- `resources/js/hooks/useErrorHandler.js`

### **Buscar y eliminar:**
```javascript
// ELIMINAR estas líneas:
console.log('=== DEBUG ===');
console.error('Error:', err);
console.warn('Warning:', warning);
```

## 🔒 **6. Configuración de Seguridad**

### **En config/app.php:**
```php
'debug' => env('APP_DEBUG', false),
'env' => env('APP_ENV', 'production'),
```

### **En config/sanctum.php:**
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## 📁 **7. Estructura de Archivos en Hostinger**

```
public_html/
├── .env                    # Configuración de producción
├── app/                    # Código de la aplicación
├── bootstrap/
├── config/
├── database/
├── public/                 # Document root
│   ├── index.php
│   ├── .htaccess
│   ├── build/             # Assets compilados
│   └── storage/           # Enlace simbólico
├── resources/
├── routes/
├── storage/
└── vendor/
```

## 🚀 **8. Comandos de Verificación**

### **Después del deploy:**
```bash
# Verificar que la app funciona
php artisan route:list

# Verificar logs
tail -f storage/logs/laravel.log

# Verificar permisos
ls -la storage/
ls -la bootstrap/cache/

# Verificar configuración
php artisan config:show
```

## ⚠️ **9. Checklist Final**

- [ ] APP_KEY generado
- [ ] APP_DEBUG=false
- [ ] APP_URL configurado con HTTPS
- [ ] Base de datos configurada
- [ ] Migraciones ejecutadas
- [ ] SendGrid configurado
- [ ] Console.logs eliminados
- [ ] Build de producción generado
- [ ] Permisos correctos (755/644)
- [ ] SSL habilitado
- [ ] .htaccess configurado
- [ ] Storage link creado
- [ ] Cache optimizado

## 🆘 **10. Troubleshooting**

### **Error 500:**
- Verificar logs en `storage/logs/laravel.log`
- Verificar permisos de archivos
- Verificar configuración de .env

### **Assets no cargan:**
- Verificar que existe `/public/build/`
- Verificar .htaccess
- Verificar rutas en `vite.config.js`

### **Base de datos:**
- Verificar credenciales en .env
- Verificar que la base de datos existe
- Verificar permisos del usuario de BD 