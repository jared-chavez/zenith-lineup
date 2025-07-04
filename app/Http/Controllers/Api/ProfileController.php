<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get user profile.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;
        
        if (!$profile) {
            return response()->json([
                'error' => 'Profile not found'
            ], 404);
        }

        return response()->json([
            'profile' => $profile
        ]);
    }

    /**
     * Update user profile.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), UserProfile::rules());

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $profile = $user->profile;

            if (!$profile) {
                $profile = $user->profile()->create($request->all());
            } else {
                $profile->update($request->all());
            }

            Log::info('Profile updated', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Profile updated successfully',
                'profile' => $profile
            ]);

        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to update profile'
            ], 500);
        }
    }
} 