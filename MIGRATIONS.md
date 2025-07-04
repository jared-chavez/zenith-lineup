# Migraciones de Base de Datos - Zenith Lineup

## Resumen de Optimizaciones

Se han optimizado las migraciones de Laravel eliminando las innecesarias y mejorando las existentes para nuestra aplicación de seguimiento de hábitos saludables.

## Migraciones Eliminadas ❌

### 1. `0001_01_01_000001_create_cache_table.php`
- **Razón**: No utilizamos cache de base de datos
- **Alternativa**: Usar cache en memoria o archivos

### 2. `0001_01_01_000002_create_jobs_table.php`
- **Razón**: No implementamos colas de trabajo
- **Alternativa**: Procesamiento síncrono o implementar colas cuando sea necesario

## Migraciones Optimizadas ✅

### 1. `0001_01_01_000000_create_users_table.php`

**Campos agregados para seguridad:**
```php
$table->boolean('is_active')->default(true);
$table->timestamp('last_login_at')->nullable();
$table->string('last_login_ip', 45)->nullable();
```

**Índices de rendimiento:**
```php
$table->index(['email', 'is_active']);
$table->index('last_login_at');
```

**Beneficios:**
- Seguimiento de actividad del usuario
- Auditoría de accesos
- Mejor rendimiento en consultas

### 2. `2025_07_03_023301_create_personal_access_tokens_table.php`
- **Mantenida**: Necesaria para Laravel Sanctum
- **Propósito**: Autenticación por tokens API

### 3. `2025_07_03_020233_create_habits_table.php`
- **Optimizada**: Campos específicos para hábitos saludables
- **Tipos**: water, sleep, exercise, nutrition, meditation
- **Índices**: Para consultas eficientes por usuario y tipo

### 4. `2025_07_03_020241_create_habit_logs_table.php`
- **Optimizada**: Estructura flexible para diferentes tipos de datos
- **Campos JSON**: Para datos específicos de cada hábito
- **Índices**: Para consultas por fecha y usuario

### 5. `2025_07_03_020246_create_user_profiles_table.php`
- **Optimizada**: Información de salud y preferencias
- **Campos JSON**: Para metas de salud y preferencias
- **Índices**: Para consultas por nivel de actividad

## Estructura Final de la Base de Datos

```
zenith_lineup/
├── users                    # Usuarios del sistema
├── personal_access_tokens   # Tokens de autenticación
├── password_reset_tokens    # Tokens de reset de contraseña
├── sessions                 # Sesiones de usuario
├── user_profiles           # Perfiles de usuario
├── habits                  # Hábitos de los usuarios
└── habit_logs              # Registros de actividad
```

## Campos de Seguridad Implementados

### Encriptación de Contraseñas
```php
$table->string('password', 255); // Campo para contraseñas encriptadas
```
- **Método**: Bcrypt con 12 rounds
- **Configuración**: En `config/security.php`

### Auditoría de Accesos
```php
$table->timestamp('last_login_at')->nullable();
$table->string('last_login_ip', 45)->nullable();
```
- **Propósito**: Seguimiento de actividad sospechosa
- **Logging**: Todos los eventos de autenticación

### Control de Estado
```php
$table->boolean('is_active')->default(true);
```
- **Propósito**: Desactivar usuarios sin eliminarlos
- **Seguridad**: Prevenir accesos no autorizados

## Índices de Rendimiento

### Usuarios
- `email, is_active`: Búsquedas de autenticación
- `last_login_at`: Análisis de actividad

### Hábitos
- `user_id, type`: Filtrado por usuario y tipo
- `user_id, is_active`: Hábitos activos del usuario

### Logs
- `habit_id, user_id, log_date`: Único por día
- `user_id, log_date`: Consultas por fecha
- `habit_id, log_date`: Análisis por hábito

## Configuración de Seguridad

### Validación de Contraseñas
```php
'password' => [
    'min_length' => 8,
    'require_uppercase' => true,
    'require_lowercase' => true,
    'require_numbers' => true,
    'require_symbols' => true,
    'bcrypt_rounds' => 12,
],
```

### Rate Limiting
```php
'rate_limiting' => [
    'auth_attempts' => 5,
    'auth_decay_minutes' => 15,
    'api_requests' => 60,
    'api_decay_minutes' => 1,
],
```

## Comandos de Migración

### Desarrollo
```bash
# Ejecutar migraciones
php artisan migrate

# Revertir migraciones
php artisan migrate:rollback

# Refrescar base de datos
php artisan migrate:refresh

# Ejecutar con seeders
php artisan migrate:fresh --seed
```

### Producción
```bash
# Ejecutar migraciones en producción
php artisan migrate --force

# Verificar estado
php artisan migrate:status
```

## Datos de Prueba

El seeder incluye:
- Usuario de prueba: `test@zenith-lineup.com`
- Contraseña: `SecurePass123!`
- 3 hábitos de ejemplo (agua, sueño, ejercicio)
- 7 días de logs de ejemplo

## Consideraciones de Seguridad

1. **Encriptación**: Todas las contraseñas se encriptan con bcrypt
2. **Auditoría**: Todos los accesos se registran
3. **Validación**: Input validation en todos los endpoints
4. **Autorización**: Verificación de propiedad de recursos
5. **Logging**: Eventos de seguridad registrados

## Próximos Pasos

1. Ejecutar migraciones: `php artisan migrate`
2. Ejecutar seeders: `php artisan db:seed`
3. Verificar estructura: `php artisan migrate:status`
4. Probar endpoints de autenticación
5. Implementar tests de seguridad 