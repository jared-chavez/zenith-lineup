<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Mail\PasswordResetMail;
use App\Models\User;

class PasswordResetController extends Controller
{
    // Solicitar reset
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $token = Str::random(64);
        $user->reset_token = $token;
        $user->reset_token_expires_at = now()->addHour();
        $user->save();

        $resetUrl = url('/reset-password?token=' . $token . '&email=' . urlencode($user->email));
        $ip = $request->ip();
        $url = config('app.url');

        Mail::to($user->email)->send(new PasswordResetMail(
            $user->name,
            $user->email,
            $resetUrl,
            $ip,
            $url
        ));

        return response()->json(['message' => 'Correo de recuperación enviado']);
    }

    // Validar token
    public function validateToken(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
            ->where('reset_token', $request->token)
            ->where('reset_token_expires_at', '>', now())
            ->first();

        return response()->json(['valid' => (bool)$user], $user ? 200 : 404);
    }

    // Resetear contraseña
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)
            ->where('reset_token', $request->token)
            ->where('reset_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Token inválido o expirado'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->reset_token_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }
}
