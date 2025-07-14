import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Loader2, Shield, Settings, Heart, Target } from 'lucide-react';
import axios from 'axios';
import TwoFactorManagement from '../components/TwoFactorManagement';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    // Remove message state
    // const [message, setMessage] = useState('');

    const notificationStore = useNotificationStore();
    const { handleError, handleValidationError } = useErrorHandler();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/profile');
            setProfile(response.data.profile);
            reset(response.data.profile);
        } catch (error) {
            handleError(error, 'fetchProfile');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSaving(true);
        // setMessage('');
        try {
            const response = await axios.put('/api/profile', data);
            setProfile(response.data.profile);
            notificationStore.success('Perfil actualizado correctamente', 'Éxito');
        } catch (error) {
            if (error.response?.status === 422 && error.response.data?.errors) {
                handleValidationError(error.response.data.errors);
            } else {
                handleError(error, 'updateProfile');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="loading-spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header - Fitia Style */}
            <div className="layer-elevated animate-fade-in">
                <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gradient-green mb-2">Mi Perfil</h1>
                            <p className="text-gray-600 text-lg">Gestiona tu información personal y preferencias</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form - Fitia Style */}
            <div className="layer-elevated animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center">
                        <Settings className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                {...register('first_name', {
                                    required: 'El nombre es requerido',
                                    maxLength: {
                                        value: 50,
                                        message: 'El nombre no puede tener más de 50 caracteres'
                                    }
                                })}
                                className={`input-fitia ${errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.first_name && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.first_name.message}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                {...register('last_name', {
                                    required: 'El apellido es requerido',
                                    maxLength: {
                                        value: 50,
                                        message: 'El apellido no puede tener más de 50 caracteres'
                                    }
                                })}
                                className={`input-fitia ${errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.last_name && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.last_name.message}
                                </p>
                            )}
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de nacimiento *
                            </label>
                            <input
                                type="date"
                                id="birth_date"
                                {...register('birth_date', {
                                    required: 'La fecha de nacimiento es requerida'
                                })}
                                className={`input-fitia ${errors.birth_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.birth_date && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.birth_date.message}
                                </p>
                            )}
                        </div>

                        {/* Gender */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                Género *
                            </label>
                            <select
                                id="gender"
                                {...register('gender', {
                                    required: 'El género es requerido'
                                })}
                                className={`input-fitia ${errors.gender ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            >
                                <option value="">Seleccionar género</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>

                        {/* Height */}
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                                Altura (cm) *
                            </label>
                            <input
                                type="number"
                                id="height"
                                {...register('height', {
                                    required: 'La altura es requerida',
                                    min: {
                                        value: 50,
                                        message: 'La altura debe ser al menos 50 cm'
                                    },
                                    max: {
                                        value: 300,
                                        message: 'La altura no puede ser mayor a 300 cm'
                                    }
                                })}
                                className={`input-fitia ${errors.height ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.height && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.height.message}
                                </p>
                            )}
                        </div>

                        {/* Weight */}
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                                Peso (kg) *
                            </label>
                            <input
                                type="number"
                                id="weight"
                                {...register('weight', {
                                    required: 'El peso es requerido',
                                    min: {
                                        value: 20,
                                        message: 'El peso debe ser al menos 20 kg'
                                    },
                                    max: {
                                        value: 500,
                                        message: 'El peso no puede ser mayor a 500 kg'
                                    }
                                })}
                                className={`input-fitia ${errors.weight ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.weight && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.weight.message}
                                </p>
                            )}
                        </div>

                        {/* Activity Level */}
                        <div>
                            <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700 mb-2">
                                Nivel de actividad *
                            </label>
                            <select
                                id="activity_level"
                                {...register('activity_level', {
                                    required: 'El nivel de actividad es requerido'
                                })}
                                className={`input-fitia ${errors.activity_level ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            >
                                <option value="">Seleccionar nivel</option>
                                <option value="sedentary">Sedentario</option>
                                <option value="light">Ligero</option>
                                <option value="moderate">Moderado</option>
                                <option value="active">Activo</option>
                                <option value="very_active">Muy activo</option>
                            </select>
                            {errors.activity_level && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.activity_level.message}
                                </p>
                            )}
                        </div>

                        {/* Timezone */}
                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                                Zona horaria *
                            </label>
                            <select
                                id="timezone"
                                {...register('timezone', {
                                    required: 'La zona horaria es requerida'
                                })}
                                className={`input-fitia ${errors.timezone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            >
                                <option value="">Seleccionar zona horaria</option>
                                <option value="America/Mexico_City">México (GMT-6)</option>
                                <option value="America/New_York">Nueva York (GMT-5)</option>
                                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                <option value="Europe/London">Londres (GMT+0)</option>
                            </select>
                            {errors.timezone && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                    {errors.timezone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Health Goals */}
                    <div className="layer-surface p-6 rounded-xl">
                        <div className="flex items-center mb-4">
                            <Heart className="h-5 w-5 text-green-600 mr-2" />
                            <label className="block text-sm font-medium text-gray-700">
                                Objetivos de salud
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['Perder peso', 'Ganar músculo', 'Mejorar resistencia', 'Reducir estrés', 'Dormir mejor'].map((goal) => (
                                <label key={goal} className="flex items-center p-3 bg-gradient-green rounded-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={goal}
                                        {...register('health_goals')}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">{goal}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="layer-surface p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Settings className="h-5 w-5 text-green-600 mr-2" />
                                <label className="block text-sm font-medium text-gray-700">
                                    Preferencias
                                </label>
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center p-3 bg-gradient-green rounded-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('preferences.notifications')}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">Recibir notificaciones</span>
                                </label>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tema
                                    </label>
                                    <select
                                        {...register('preferences.theme')}
                                        className="input-fitia"
                                    >
                                        <option value="light">Claro</option>
                                        <option value="dark">Oscuro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="layer-surface p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Shield className="h-5 w-5 text-green-600 mr-2" />
                                <label className="block text-sm font-medium text-gray-700">
                                    Privacidad
                                </label>
                            </div>
                            <label className="flex items-center p-3 bg-gradient-green rounded-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('is_profile_public')}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-sm text-gray-700">Perfil público</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary"
                        >
                            {isSaving ? (
                                <div className="flex items-center">
                                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                                    Guardando...
                                </div>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="animate-fade-in">
                <TwoFactorManagement />
            </div>
        </div>
    );
};

export default Profile; 