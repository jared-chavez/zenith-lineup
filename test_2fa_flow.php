<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\TwoFactorCode;
use Illuminate\Support\Facades\DB;

// Simular el flujo de login con 2FA
echo "=== PRUEBA DE FLUJO 2FA ===\n";

// 1. Buscar usuario con 2FA activado
$user = User::where('email', 'angeljaredchaveztorres+1@gmail.com')->first();

if (!$user) {
    echo "Usuario no encontrado\n";
    exit;
}

echo "Usuario encontrado: {$user->email}\n";
echo "2FA activado: " . ($user->two_factor_enabled ? 'Sí' : 'No') . "\n";

// 2. Verificar códigos existentes
echo "\n=== CÓDIGOS EXISTENTES ===\n";
$codes = TwoFactorCode::where('user_id', $user->id)->get();
echo "Códigos en BD: " . $codes->count() . "\n";

foreach ($codes as $code) {
    echo "- Código: {$code->code}, Expira: {$code->expires_at}, Creado: {$code->created_at}\n";
}

// 3. Simular envío de código
echo "\n=== SIMULANDO ENVÍO DE CÓDIGO ===\n";

// Eliminar códigos anteriores
TwoFactorCode::where('user_id', $user->id)->delete();
echo "Códigos anteriores eliminados\n";

// Generar nuevo código
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
echo "Nuevo código generado: {$code}\n";

// Crear código en BD
TwoFactorCode::create([
    'user_id' => $user->id,
    'code' => $code,
    'expires_at' => now()->addMinutes(10),
]);

echo "Código guardado en BD\n";

// 4. Verificar códigos después del envío
echo "\n=== CÓDIGOS DESPUÉS DEL ENVÍO ===\n";
$codes = TwoFactorCode::where('user_id', $user->id)->get();
echo "Códigos en BD: " . $codes->count() . "\n";

foreach ($codes as $code) {
    echo "- Código: {$code->code}, Expira: {$code->expires_at}, Creado: {$code->created_at}\n";
}

// 5. Simular verificación
echo "\n=== SIMULANDO VERIFICACIÓN ===\n";
$twoFactorCode = TwoFactorCode::where('user_id', $user->id)
    ->where('code', $code)
    ->where('expires_at', '>', now())
    ->first();

if ($twoFactorCode) {
    echo "Código válido encontrado\n";
    
    // Marcar como verificado
    $user->update([
        'two_factor_verified_at' => now(),
        'last_login_at' => now()
    ]);
    
    // Eliminar código usado
    $twoFactorCode->delete();
    echo "Código verificado y eliminado\n";
} else {
    echo "Código no válido o expirado\n";
}

echo "\n=== FIN DE PRUEBA ===\n"; 