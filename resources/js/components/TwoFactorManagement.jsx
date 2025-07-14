import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldX, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';

const TwoFactorManagement = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [setupCode, setSetupCode] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    // Remove error and success states
    // const [error, setError] = useState('');
    // const [success, setSuccess] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    const notificationStore = useNotificationStore();
    const { handleError, handleValidationError } = useErrorHandler();

    useEffect(() => {
        checkTwoFactorStatus();
    }, []);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const checkTwoFactorStatus = async () => {
        try {
            const response = await axios.get('/api/auth/2fa/status');
            setIsEnabled(response.data.enabled);
        } catch (error) {
            handleError(error, 'checkTwoFactorStatus');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        setIsUpdating(true);
        // setError('');
        // setSuccess('');

        try {
            const response = await axios.post('/api/auth/2fa/enable');
            setSetupCode(response.data.code);
            setShowSetup(true);
            setTimeLeft(300); // 5 minutes to complete setup
        } catch (error) {
            handleError(error, 'enable2FA');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmSetup = async () => {
        if (!confirmCode.trim()) {
            notificationStore.error('Por favor ingresa el código de confirmación', 'Código requerido');
            return;
        }

        setIsUpdating(true);
        // setError('');

        try {
            await axios.post('/api/auth/2fa/confirm', {
                code: confirmCode.trim()
            });
            
            notificationStore.success('Verificación en dos pasos habilitada exitosamente', '2FA Habilitado');
            setShowSetup(false);
            setSetupCode('');
            setConfirmCode('');
            setIsEnabled(true);
            setTimeLeft(0);
        } catch (error) {
            if (error.response?.status === 422 && error.response.data?.errors) {
                handleValidationError(error.response.data.errors);
            } else {
                handleError(error, 'confirm2FA');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm('¿Estás seguro de que quieres deshabilitar la verificación en dos pasos? Esto reducirá la seguridad de tu cuenta.')) {
            return;
        }

        setIsUpdating(true);
        // setError('');
        // setSuccess('');

        try {
            await axios.post('/api/auth/2fa/disable');
            notificationStore.success('Verificación en dos pasos deshabilitada exitosamente', '2FA Deshabilitado');
            setIsEnabled(false);
        } catch (error) {
            handleError(error, 'disable2FA');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResendCode = async () => {
        setIsUpdating(true);
        // setError('');

        try {
            const response = await axios.post('/api/auth/2fa/enable');
            setSetupCode(response.data.code);
            setTimeLeft(300);
            notificationStore.info('Nuevo código enviado a tu correo electrónico', 'Código reenviado');
        } catch (error) {
            handleError(error, 'resend2FACode');
        } finally {
            setIsUpdating(false);
        }
    };

    const cancelSetup = () => {
        setShowSetup(false);
        setSetupCode('');
        setConfirmCode('');
        // setError('');
        setTimeLeft(0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (showSetup) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Configurar verificación en dos pasos
                    </h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        Hemos enviado un código de verificación a tu correo electrónico.
                        Ingresa el código para completar la configuración.
                    </p>

                    {timeLeft > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
                            Tienes {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} para completar la configuración
                        </div>
                    )}

                    {/* Remove old error UI */}
                    {/* {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                            {error}
                        </div>
                    )} */}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="confirmCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Código de verificación
                            </label>
                            <input
                                id="confirmCode"
                                type="text"
                                value={confirmCode}
                                onChange={(e) => setConfirmCode(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="123456"
                                maxLength="6"
                                autoComplete="one-time-code"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleConfirmSetup}
                                disabled={isUpdating || !confirmCode.trim() || timeLeft === 0}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                                ) : (
                                    'Confirmar'
                                )}
                            </button>

                            <button
                                onClick={handleResendCode}
                                disabled={isUpdating || timeLeft > 0}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : timeLeft > 0 ? (
                                    `${timeLeft}s`
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </button>

                            <button
                                onClick={cancelSetup}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    {isEnabled ? (
                        <ShieldCheck className="h-6 w-6 text-green-600 mr-2" />
                    ) : (
                        <ShieldX className="h-6 w-6 text-gray-400 mr-2" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                        Verificación en dos pasos
                    </h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {isEnabled ? 'Habilitada' : 'Deshabilitada'}
                </span>
            </div>

            {/* Remove old error and success UI */}
            {/* {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                    {success}
                </div>
            )} */}

            <p className="text-gray-600 mb-6">
                {isEnabled 
                    ? 'La verificación en dos pasos está habilitada. Recibirás un código por correo electrónico cada vez que inicies sesión.'
                    : 'Habilita la verificación en dos pasos para agregar una capa adicional de seguridad a tu cuenta.'
                }
            </p>

            <div className="flex space-x-3">
                {!isEnabled ? (
                    <button
                        onClick={handleEnable2FA}
                        disabled={isUpdating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                            'Habilitar 2FA'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleDisable2FA}
                        disabled={isUpdating}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                            'Deshabilitar 2FA'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TwoFactorManagement; 