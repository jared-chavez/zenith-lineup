<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\TwoFactorController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Create user profile
            $user->profile()->create([
                'timezone' => $request->get('timezone', 'UTC'),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('User registered successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user->only(['id', 'name', 'email', 'role']),
                'token' => $token,
                'token_type' => 'Bearer'
            ], 201);

        } catch (\Exception $e) {
            Log::error('User registration failed', [
                'error' => $e->getMessage(),
                'email' => $request->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'error' => 'Registration failed'
            ], 500);
        }
    }

    /**
     * Login user.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::guard('web')->attempt($request->only('email', 'password'))) {
            Log::warning('Failed login attempt', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'error' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::guard('web')->user();
        
        // Check if 2FA is enabled
        if ($user->two_factor_enabled) {
            // Logout user temporarily
            Auth::guard('web')->logout();
            
            Log::info('2FA required for login', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => '2FA required. Please request a verification code.',
                'requires_2fa' => true
            ]);
        }
        
        // Actualizar información de último login
        $user->update([
            'last_login_at' => now(),
        ]);
        
        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('User logged in successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if ($user) {
            // Delete all tokens for the user
            $user->tokens()->delete();
            
            // Logout from web guard
            Auth::guard('web')->logout();
            
            Log::info('User logged out', [
                'user_id' => $user->id,
                'ip' => $request->ip()
            ]);
        } else {
            // Token is invalid or expired, but we still want to return success
            // This handles cases like token refresh where the original token becomes invalid
            Log::info('Logout attempted with invalid token', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Logout user with invalid token handling.
     * This method is called when the token is invalid but we still want to handle logout gracefully.
     */
    public function logoutInvalid(Request $request): JsonResponse
    {
        // Extract token from Authorization header
        $authHeader = $request->header('Authorization');
        $token = null;
        
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        }
        
        if ($token) {
            // Try to find and delete the token if it exists
            try {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($tokenModel) {
                    $tokenModel->delete();
                    Log::info('Invalid token deleted during logout', [
                        'token_id' => $tokenModel->id,
                        'ip' => $request->ip()
                    ]);
                }
            } catch (\Exception $e) {
                // Token doesn't exist or is malformed, which is fine
                Log::info('Token not found during logout', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }
        }
        
        Log::info('Logout with invalid token handled gracefully', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'profile' => $user->profile
        ]);
    }

    /**
     * Refresh token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * Delete user account.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => ['required', 'string'],
            'confirmation' => ['required', 'string', 'in:DELETE_MY_ACCOUNT'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Contraseña incorrecta'
            ], 401);
        }

        try {
            // Delete all user tokens
            $user->tokens()->delete();
            
            // Delete user profile if exists
            if ($user->profile) {
                $user->profile->delete();
            }
            
            // Delete user habits and logs
            $user->habits()->delete();
            $user->habitLogs()->delete();
            
            // Store user info for audit log before deletion
            $userInfo = $user->getAttributes();
            
            // Delete the user
            $user->delete();

            Log::info('User account deleted', [
                'user_id' => $userInfo['id'],
                'email' => $userInfo['email'],
                'ip' => $request->ip()
            ]);

            return response()->json([
                'message' => 'Cuenta eliminada correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Account deletion failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'error' => 'Error al eliminar la cuenta'
            ], 500);
        }
    }
} 