<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $profile = $user->profile;

            if (!$profile) {
                $profile = $user->profile()->create($request->validated());
            } else {
                $profile->update($request->validated());
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