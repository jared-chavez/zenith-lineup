import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, User, Loader2, Shield, Settings, Heart, Target, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TwoFactorManagement from '../components/TwoFactorManagement';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';
import useAuthStore from '../stores/authStore';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [missingProfile, setMissingProfile] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // Remove message state
    // const [message, setMessage] = useState('');

    const notificationStore = useNotificationStore();
    const { handleError, handleValidationError } = useErrorHandler();
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const {
        register: registerDelete,
        handleSubmit: handleSubmitDelete,
        formState: { errors: deleteErrors },
        reset: resetDelete
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
            setMissingProfile(false);
        } catch (error) {
            if (error.response?.status === 404) {
                setMissingProfile(true);
                setProfile(null);
                reset({});
            } else {
                handleError(error, 'fetchProfile');
            }
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
            setMissingProfile(false);
            reset(response.data.profile);
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

    const handleDeleteAccount = async (data) => {
        setIsDeleting(true);
        try {
            await axios.delete('/api/auth/delete-account', {
                data: {
                    password: data.password,
                    confirmation: data.confirmation
                }
            });
            
            notificationStore.success('Cuenta eliminada correctamente', 'Éxito');
            await logout();
            navigate('/');
        } catch (error) {
            if (error.response?.status === 422 && error.response.data?.errors) {
                handleValidationError(error.response.data.errors);
            } else {
                handleError(error, 'deleteAccount');
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            resetDelete();
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Si falta el perfil, mostrar formulario de creación
    if (missingProfile) {
        return (
            <div className="profile-missing-container">
                <div className="profile-missing-card">
                    <div className="profile-missing-header">
                        <div className="profile-missing-icon-container">
                            <User className="profile-missing-icon" />
                        </div>
                        <div className="profile-missing-content">
                            <h1 className="profile-missing-title">Completa tu perfil para continuar</h1>
                            <p className="profile-missing-subtitle">Necesitamos algunos datos básicos para personalizar tu experiencia</p>
                        </div>
                    </div>
                    <div className="profile-section-header">
                        <Settings className="profile-section-icon" />
                        <h3 className="profile-section-title">Información Personal</h3>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
                        <div className="profile-form-grid">
                            {/* First Name */}
                            <div className="profile-form-field">
                                <label htmlFor="first_name" className="profile-form-label">
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
                                    className={`profile-input ${errors.first_name ? 'profile-input-error' : ''}`}
                                />
                                {errors.first_name && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.first_name.message}
                                    </p>
                                )}
                            </div>
                            {/* Last Name */}
                            <div className="profile-form-field">
                                <label htmlFor="last_name" className="profile-form-label">
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
                                    className={`profile-input ${errors.last_name ? 'profile-input-error' : ''}`}
                                />
                                {errors.last_name && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.last_name.message}
                                    </p>
                                )}
                            </div>
                            {/* Birth Date */}
                            <div className="profile-form-field">
                                <label htmlFor="birth_date" className="profile-form-label">
                                    Fecha de nacimiento *
                                </label>
                                <input
                                    type="date"
                                    id="birth_date"
                                    {...register('birth_date', {
                                        required: 'La fecha de nacimiento es requerida'
                                    })}
                                    className={`profile-input ${errors.birth_date ? 'profile-input-error' : ''}`}
                                />
                                {errors.birth_date && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.birth_date.message}
                                    </p>
                                )}
                            </div>
                            {/* Gender */}
                            <div className="profile-form-field">
                                <label htmlFor="gender" className="profile-form-label">
                                    Género *
                                </label>
                                <select
                                    id="gender"
                                    {...register('gender', {
                                        required: 'El género es requerido'
                                    })}
                                    className={`profile-input ${errors.gender ? 'profile-input-error' : ''}`}
                                >
                                    <option value="">Seleccionar género</option>
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                    <option value="other">Otro</option>
                                </select>
                                {errors.gender && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="profile-form-actions">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="profile-btn-primary"
                            >
                                {isSaving ? (
                                    <div className="profile-btn-content">
                                        <div className="loading-spinner"></div>
                                        Guardando...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="profile-btn-icon" />
                                        Guardar perfil
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="profile-container">
                <div className="profile-card">
                    {/* Header - Moderno, animado y visualmente separado */}
                    <div className="profile-header">
                        <div className="profile-header-icon">
                            <div className="profile-header-icon-bg">
                                <User className="profile-header-icon-svg" />
                            </div>
                        </div>
                        <div className="profile-header-content">
                            <h1 className="profile-title">Mi Perfil</h1>
                            <p className="profile-subtitle">Gestiona tu información personal y preferencias</p>
                        </div>
                    </div>
                    
                    <div className="profile-section-header">
                        <Settings className="profile-section-icon" />
                        <h3 className="profile-section-title">Información Personal</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
                        <div className="profile-form-grid">
                            {/* First Name */}
                            <div className="profile-form-field">
                                <label htmlFor="first_name" className="profile-form-label">
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
                                    className={`profile-input ${errors.first_name ? 'profile-input-error' : ''}`}
                                />
                                {errors.first_name && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.first_name.message}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="profile-form-field">
                                <label htmlFor="last_name" className="profile-form-label">
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
                                    className={`profile-input ${errors.last_name ? 'profile-input-error' : ''}`}
                                />
                                {errors.last_name && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.last_name.message}
                                    </p>
                                )}
                            </div>

                            {/* Birth Date */}
                            <div className="profile-form-field">
                                <label htmlFor="birth_date" className="profile-form-label">
                                    Fecha de nacimiento *
                                </label>
                                <input
                                    type="date"
                                    id="birth_date"
                                    {...register('birth_date', {
                                        required: 'La fecha de nacimiento es requerida'
                                    })}
                                    className={`profile-input ${errors.birth_date ? 'profile-input-error' : ''}`}
                                />
                                {errors.birth_date && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.birth_date.message}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="profile-form-field">
                                <label htmlFor="gender" className="profile-form-label">
                                    Género *
                                </label>
                                <select
                                    id="gender"
                                    {...register('gender', {
                                        required: 'El género es requerido'
                                    })}
                                    className={`profile-input ${errors.gender ? 'profile-input-error' : ''}`}
                                >
                                    <option value="">Seleccionar género</option>
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                    <option value="other">Otro</option>
                                </select>
                                {errors.gender && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>

                            {/* Height */}
                            <div className="profile-form-field">
                                <label htmlFor="height" className="profile-form-label">
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
                                    className={`profile-input ${errors.height ? 'profile-input-error' : ''}`}
                                />
                                {errors.height && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.height.message}
                                    </p>
                                )}
                            </div>

                            {/* Weight */}
                            <div className="profile-form-field">
                                <label htmlFor="weight" className="profile-form-label">
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
                                    className={`profile-input ${errors.weight ? 'profile-input-error' : ''}`}
                                />
                                {errors.weight && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.weight.message}
                                    </p>
                                )}
                            </div>

                            {/* Activity Level */}
                            <div className="profile-form-field">
                                <label htmlFor="activity_level" className="profile-form-label">
                                    Nivel de actividad *
                                </label>
                                <select
                                    id="activity_level"
                                    {...register('activity_level', {
                                        required: 'El nivel de actividad es requerido'
                                    })}
                                    className={`profile-input ${errors.activity_level ? 'profile-input-error' : ''}`}
                                >
                                    <option value="">Seleccionar nivel</option>
                                    <option value="sedentary">Sedentario</option>
                                    <option value="light">Ligero</option>
                                    <option value="moderate">Moderado</option>
                                    <option value="active">Activo</option>
                                    <option value="very_active">Muy activo</option>
                                </select>
                                {errors.activity_level && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.activity_level.message}
                                    </p>
                                )}
                            </div>

                            {/* Timezone */}
                            <div className="profile-form-field">
                                <label htmlFor="timezone" className="profile-form-label">
                                    Zona horaria *
                                </label>
                                <select
                                    id="timezone"
                                    {...register('timezone', {
                                        required: 'La zona horaria es requerida'
                                    })}
                                    className={`profile-input ${errors.timezone ? 'profile-input-error' : ''}`}
                                >
                                    <option value="">Seleccionar zona horaria</option>
                                    <option value="America/Mexico_City">México (GMT-6)</option>
                                    <option value="America/New_York">Nueva York (GMT-5)</option>
                                    <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                    <option value="Europe/London">Londres (GMT+0)</option>
                                </select>
                                {errors.timezone && (
                                    <p className="profile-error-message">
                                        <span className="profile-error-dot"></span>
                                        {errors.timezone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Health Goals */}
                        <div className="profile-section-card">
                            <div className="profile-section-header">
                                <Heart className="profile-section-icon" />
                                <label className="profile-form-label">
                                    Objetivos de salud
                                </label>
                            </div>
                            <div className="profile-goals-grid">
                                {['Perder peso', 'Ganar músculo', 'Mejorar resistencia', 'Reducir estrés', 'Dormir mejor'].map((goal) => (
                                    <label key={goal} className="profile-goal-item">
                                        <input
                                            type="checkbox"
                                            value={goal}
                                            {...register('health_goals')}
                                            className="profile-checkbox"
                                        />
                                        <span className="profile-goal-text">{goal}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="profile-preferences-grid">
                            <div className="profile-section-card">
                                <div className="profile-section-header">
                                    <Settings className="profile-section-icon" />
                                    <label className="profile-form-label">
                                        Preferencias
                                    </label>
                                </div>
                                <div className="profile-preferences-list">
                                    <label className="profile-preference-item">
                                        <input
                                            type="checkbox"
                                            {...register('preferences.notifications')}
                                            className="profile-checkbox"
                                        />
                                        <span className="profile-preference-text">Recibir notificaciones</span>
                                    </label>
                                    
                                    <div className="profile-form-field">
                                        <label className="profile-form-label">
                                            Tema
                                        </label>
                                        <select
                                            {...register('preferences.theme')}
                                            className="profile-input"
                                        >
                                            <option value="light">Claro</option>
                                            <option value="dark">Oscuro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section-card">
                                <div className="profile-section-header">
                                    <Shield className="profile-section-icon" />
                                    <label className="profile-form-label">
                                        Privacidad
                                    </label>
                                </div>
                                <label className="profile-preference-item">
                                    <input
                                        type="checkbox"
                                        {...register('is_profile_public')}
                                        className="profile-checkbox"
                                    />
                                    <span className="profile-preference-text">Perfil público</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="profile-form-actions">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="profile-btn-primary"
                            >
                                {isSaving ? (
                                    <div className="profile-btn-content">
                                        <div className="loading-spinner"></div>
                                        Guardar cambios
                                    </div>
                                ) : (
                                    <>
                                        <Save className="profile-btn-icon" />
                                        Guardar cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="profile-two-factor">
                    <TwoFactorManagement />
                </div>

                {/* Delete Account Section */}
                <div className="profile-delete-section">
                    <div className="profile-delete-card">
                        <div className="profile-delete-header">
                            <AlertTriangle className="profile-delete-icon" />
                            <h3 className="profile-delete-title">Zona de Peligro</h3>
                        </div>
                        <p className="profile-delete-text">
                            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de que esto es lo que realmente quieres hacer.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="profile-btn-danger"
                        >
                            <Trash2 className="profile-btn-icon" />
                            Eliminar mi cuenta
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal">
                        <div className="profile-modal-header">
                            <div className="profile-modal-icon-container">
                                <AlertTriangle className="profile-modal-icon" />
                            </div>
                            <div className="profile-modal-content">
                                <h3 className="profile-modal-title">Eliminar cuenta</h3>
                                <p className="profile-modal-subtitle">Esta acción no se puede deshacer</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmitDelete(handleDeleteAccount)} className="profile-modal-form">
                            <div className="profile-form-field">
                                <label className="profile-form-label">
                                    Contraseña *
                                </label>
                                <input
                                    type="password"
                                    {...registerDelete('password', {
                                        required: 'La contraseña es requerida'
                                    })}
                                    className={`profile-input ${deleteErrors.password ? 'profile-input-error' : ''}`}
                                    placeholder="Ingresa tu contraseña"
                                />
                                {deleteErrors.password && (
                                    <p className="profile-error-message">{deleteErrors.password.message}</p>
                                )}
                            </div>
                            
                            <div className="profile-form-field">
                                <label className="profile-form-label">
                                    Confirmación *
                                </label>
                                <input
                                    type="text"
                                    {...registerDelete('confirmation', {
                                        required: 'La confirmación es requerida',
                                        validate: value => value === 'DELETE_MY_ACCOUNT' || 'Debes escribir DELETE_MY_ACCOUNT para confirmar'
                                    })}
                                    className={`profile-input ${deleteErrors.confirmation ? 'profile-input-error' : ''}`}
                                    placeholder="Escribe DELETE_MY_ACCOUNT"
                                />
                                {deleteErrors.confirmation && (
                                    <p className="profile-error-message">{deleteErrors.confirmation.message}</p>
                                )}
                            </div>
                            
                            <div className="profile-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        resetDelete();
                                    }}
                                    className="profile-btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    className="profile-btn-danger"
                                >
                                    {isDeleting ? (
                                        <div className="profile-btn-content">
                                            <div className="loading-spinner"></div>
                                            Eliminando...
                                        </div>
                                    ) : (
                                        'Eliminar cuenta'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile; 