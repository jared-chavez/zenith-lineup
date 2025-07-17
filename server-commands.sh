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
