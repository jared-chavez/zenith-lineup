import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

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
        try {
            const response = await axios.get('/api/profile');
            setProfile(response.data.profile);
            reset(response.data.profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSaving(true);
        setMessage('');
        
        try {
            const response = await axios.put('/api/profile', data);
            setProfile(response.data.profile);
            setMessage('Perfil actualizado correctamente');
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error al actualizar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
                    <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-md ${
                    message.includes('Error') 
                        ? 'bg-red-50 border border-red-200 text-red-700' 
                        : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                    {message}
                </div>
            )}

            {/* Profile Form */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
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
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.first_name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.first_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
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
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.last_name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.last_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                            )}
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                                Fecha de nacimiento *
                            </label>
                            <input
                                type="date"
                                id="birth_date"
                                {...register('birth_date', {
                                    required: 'La fecha de nacimiento es requerida'
                                })}
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.birth_date ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.birth_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
                            )}
                        </div>

                        {/* Gender */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                Género *
                            </label>
                            <select
                                id="gender"
                                {...register('gender', {
                                    required: 'El género es requerido'
                                })}
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.gender ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Seleccionar género</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                            )}
                        </div>

                        {/* Height */}
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
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
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.height ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.height && (
                                <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                            )}
                        </div>

                        {/* Weight */}
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
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
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.weight ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.weight && (
                                <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                            )}
                        </div>

                        {/* Activity Level */}
                        <div>
                            <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700">
                                Nivel de actividad *
                            </label>
                            <select
                                id="activity_level"
                                {...register('activity_level', {
                                    required: 'El nivel de actividad es requerido'
                                })}
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.activity_level ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Seleccionar nivel</option>
                                <option value="sedentary">Sedentario</option>
                                <option value="light">Ligero</option>
                                <option value="moderate">Moderado</option>
                                <option value="active">Activo</option>
                                <option value="very_active">Muy activo</option>
                            </select>
                            {errors.activity_level && (
                                <p className="mt-1 text-sm text-red-600">{errors.activity_level.message}</p>
                            )}
                        </div>

                        {/* Timezone */}
                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                Zona horaria *
                            </label>
                            <select
                                id="timezone"
                                {...register('timezone', {
                                    required: 'La zona horaria es requerida'
                                })}
                                className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.timezone ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Seleccionar zona horaria</option>
                                <option value="America/Mexico_City">México (GMT-6)</option>
                                <option value="America/New_York">Nueva York (GMT-5)</option>
                                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                <option value="Europe/London">Londres (GMT+0)</option>
                            </select>
                            {errors.timezone && (
                                <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Health Goals */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Objetivos de salud
                        </label>
                        <div className="space-y-2">
                            {['Perder peso', 'Ganar músculo', 'Mejorar resistencia', 'Reducir estrés', 'Dormir mejor'].map((goal) => (
                                <label key={goal} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={goal}
                                        {...register('health_goals')}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{goal}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferencias
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register('preferences.notifications')}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Recibir notificaciones</span>
                                </label>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tema
                                    </label>
                                    <select
                                        {...register('preferences.theme')}
                                        className="block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="light">Claro</option>
                                        <option value="dark">Oscuro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Privacidad
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register('is_profile_public')}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Perfil público</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile; 