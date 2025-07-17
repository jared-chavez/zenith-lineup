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
