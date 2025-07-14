<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PushNotificationController extends Controller
{
    /**
     * Subscribe to push notifications
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
            'p256dh' => 'required|string',
            'auth' => 'required|string',
            'preferences' => 'sometimes|array',
        ]);

        $user = $request->user();

        // Update or create subscription
        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'user_id' => $user->id,
                'p256dh' => $validated['p256dh'],
                'auth' => $validated['auth'],
                'preferences' => $validated['preferences'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Suscripción a notificaciones exitosa',
            'subscription' => $subscription,
        ]);
    }

    /**
     * Unsubscribe from push notifications
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        $user = $request->user();

        $subscription = PushSubscription::where('endpoint', $validated['endpoint'])
            ->where('user_id', $user->id)
            ->first();

        if ($subscription) {
            $subscription->delete();
        }

        return response()->json([
            'message' => 'Desuscripción exitosa',
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.reminders' => 'boolean',
            'preferences.achievements' => 'boolean',
            'preferences.streaks' => 'boolean',
            'preferences.weekly_reports' => 'boolean',
            'preferences.daily_motivation' => 'boolean',
        ]);

        $user = $request->user();

        // Update all user's subscriptions
        $user->pushSubscriptions()->update([
            'preferences' => $validated['preferences']
        ]);

        return response()->json([
            'message' => 'Preferencias actualizadas',
            'preferences' => $validated['preferences'],
        ]);
    }

    /**
     * Get user's notification preferences
     */
    public function getPreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $subscription = $user->pushSubscriptions()->first();
        
        $preferences = $subscription ? $subscription->merged_preferences : [];

        return response()->json([
            'preferences' => $preferences,
            'has_subscription' => $subscription !== null,
        ]);
    }

    /**
     * Send test notification
     */
    public function sendTest(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $subscription = $user->pushSubscriptions()->first();
        
        if (!$subscription) {
            return response()->json([
                'error' => 'No tienes suscripción activa a notificaciones'
            ], 400);
        }

        // This would integrate with a push notification service
        // For now, we'll just log the attempt
        Log::info('Test notification would be sent', [
            'user_id' => $user->id,
            'endpoint' => $subscription->endpoint,
        ]);

        return response()->json([
            'message' => 'Notificación de prueba enviada',
        ]);
    }

    /**
     * Get subscription status
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $subscriptions = $user->pushSubscriptions;
        
        return response()->json([
            'has_subscriptions' => $subscriptions->count() > 0,
            'subscription_count' => $subscriptions->count(),
            'subscriptions' => $subscriptions->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'endpoint' => $sub->endpoint,
                    'preferences' => $sub->merged_preferences,
                    'created_at' => $sub->created_at,
                ];
            }),
        ]);
    }
} 