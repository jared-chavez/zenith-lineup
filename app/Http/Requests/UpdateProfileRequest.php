<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // El usuario autenticado puede actualizar su perfil
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'birth_date' => ['required', 'date', 'after:1900-01-01'],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'height' => ['required', 'numeric', 'min:50', 'max:300'],
            'weight' => ['required', 'numeric', 'min:20', 'max:500'],
            'activity_level' => ['required', Rule::in(['sedentary', 'light', 'moderate', 'active', 'very_active'])],
            'health_goals' => ['nullable', 'array'],
            'health_goals.*' => ['string', 'max:255'],
            'preferences' => ['nullable', 'array'],
            'preferences.notifications' => ['nullable', 'boolean'],
            'preferences.theme' => ['nullable', Rule::in(['dark', 'light'])],
            'timezone' => ['required', 'string', 'max:100'],
            'is_profile_public' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Validar que solo se permitan claves específicas en preferences
            $allowedKeys = ['notifications', 'theme'];
            $preferences = $this->input('preferences', []);
            
            if (is_array($preferences)) {
                foreach (array_keys($preferences) as $key) {
                    if (!in_array($key, $allowedKeys)) {
                        $validator->errors()->add('preferences', "Unknown preference key: $key");
                    }
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'gender.in' => 'The gender must be male, female, or other.',
            'activity_level.in' => 'The activity level must be sedentary, light, moderate, active, or very_active.',
            'preferences.theme.in' => 'The theme must be dark or light.',
            'height.min' => 'The height must be at least 50 cm.',
            'height.max' => 'The height must not be greater than 300 cm.',
            'weight.min' => 'The weight must be at least 20 kg.',
            'weight.max' => 'The weight must not be greater than 500 kg.',
        ];
    }
}
