<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TwoFactorCode;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TwoFactorController extends Controller
{
    /**
     * Generar y enviar código 2FA por email
     */
    public function sendCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Verificar si el usuario tiene 2FA activado
        if (!$user->two_factor_enabled) {
            return response()->json([
                'error' => '2FA no está activado para este usuario'
            ], 400);
        }

        // Generar código de 6 dígitos
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Eliminar códigos anteriores del usuario
        TwoFactorCode::where('user_id', $user->id)->delete();
        
        // Crear nuevo código
        TwoFactorCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10), // Expira en 10 minutos
        ]);

        // Enviar código por email
        $user->notify(new TwoFactorCodeNotification($code));

        return response()->json([
            'message' => 'Código de verificación enviado a tu email',
            'expires_in' => 600 // 10 minutos en segundos
        ]);
    }

    /**
     * Verificar código 2FA
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        // Buscar código válido
        $twoFactorCode = TwoFactorCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->first();

        if (!$twoFactorCode) {
            return response()->json([
                'error' => 'Código inválido o expirado'
            ], 400);
        }

        // Marcar como verificado y actualizar último login
        $user->update([
            'two_factor_verified_at' => now(),
            'last_login_at' => now()
        ]);

        // Eliminar código usado
        $twoFactorCode->delete();

        // Crear token de autenticación
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Código verificado correctamente',
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'token' => $token,
            'token_type' => 'Bearer',
            'success' => true
        ]);
    }

    /**
     * Activar 2FA para el usuario autenticado
     */
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json([
                'error' => '2FA ya está activado'
            ], 400);
        }

        // Generar código de activación
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Eliminar códigos anteriores
        TwoFactorCode::where('user_id', $user->id)->delete();
        
        // Crear código de activación
        TwoFactorCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Enviar código por email
        $user->notify(new TwoFactorCodeNotification($code));

        return response()->json([
            'message' => 'Código de activación enviado a tu email',
            'expires_in' => 600
        ]);
    }

    /**
     * Confirmar activación de 2FA
     */
    public function confirmEnable(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verificar código
        $twoFactorCode = TwoFactorCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('expires_at', '>', now())
            ->first();

        if (!$twoFactorCode) {
            return response()->json([
                'error' => 'Código inválido o expirado'
            ], 400);
        }

        // Activar 2FA
        $user->update([
            'two_factor_enabled' => true,
            'two_factor_verified_at' => now()
        ]);

        // Eliminar código usado
        $twoFactorCode->delete();

        return response()->json([
            'message' => '2FA activado correctamente',
            'user' => $user->only(['id', 'name', 'email', 'role', 'two_factor_enabled'])
        ]);
    }

    /**
     * Desactivar 2FA
     */
    public function disable(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->two_factor_enabled) {
            return response()->json([
                'error' => '2FA no está activado'
            ], 400);
        }

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_verified_at' => null
        ]);

        // Eliminar códigos pendientes
        TwoFactorCode::where('user_id', $user->id)->delete();

        return response()->json([
            'message' => '2FA desactivado correctamente',
            'user' => $user->only(['id', 'name', 'email', 'role', 'two_factor_enabled'])
        ]);
    }

    /**
     * Obtener estado de 2FA del usuario
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'two_factor_enabled' => $user->two_factor_enabled,
            'two_factor_verified_at' => $user->two_factor_verified_at,
        ]);
    }
} 