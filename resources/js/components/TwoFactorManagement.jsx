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
            setIsEnabled(response.data.two_factor_enabled);
        } catch (error) {
            handleError(error, 'checkTwoFactorStatus');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnable2FA = async () => {
        setIsUpdating(true);

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
        setTimeLeft(0);
    };

    if (isLoading) {
        return (
            <div className="two-factor-loading">
                <Loader2 className="two-factor-loading-spinner" />
            </div>
        );
    }

    if (showSetup) {
        return (
            <div className="two-factor-setup-card">
                <div className="two-factor-setup-header">
                    <Shield className="two-factor-setup-icon" />
                    <h3 className="two-factor-setup-title">
                        Configurar verificación en dos pasos
                    </h3>
                </div>

                <div className="two-factor-setup-content">
                    <p className="two-factor-setup-description">
                        Hemos enviado un código de verificación a tu correo electrónico.
                        Ingresa el código para completar la configuración.
                    </p>

                    {timeLeft > 0 && (
                        <div className="two-factor-timer-warning">
                            Tienes {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} para completar la configuración
                        </div>
                    )}

                    <div className="two-factor-setup-form">
                        <div className="two-factor-form-field">
                            <label htmlFor="confirmCode" className="two-factor-form-label">
                                Código de verificación
                            </label>
                            <input
                                id="confirmCode"
                                type="text"
                                value={confirmCode}
                                onChange={(e) => setConfirmCode(e.target.value)}
                                className="two-factor-form-input"
                                placeholder="123456"
                                maxLength="6"
                                autoComplete="one-time-code"
                            />
                        </div>

                        <div className="two-factor-setup-actions">
                            <button
                                onClick={handleConfirmSetup}
                                disabled={isUpdating || !confirmCode.trim() || timeLeft === 0}
                                className="two-factor-btn-primary"
                            >
                                {isUpdating ? (
                                    <Loader2 className="two-factor-btn-spinner" />
                                ) : (
                                    'Confirmar'
                                )}
                            </button>

                            <button
                                onClick={handleResendCode}
                                disabled={isUpdating || timeLeft > 0}
                                className="two-factor-btn-secondary"
                            >
                                {isUpdating ? (
                                    <Loader2 className="two-factor-btn-spinner" />
                                ) : timeLeft > 0 ? (
                                    `${timeLeft}s`
                                ) : (
                                    <RefreshCw className="two-factor-btn-icon" />
                                )}
                            </button>

                            <button
                                onClick={cancelSetup}
                                className="two-factor-btn-cancel"
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
        <div className="two-factor-card">
            <div className="two-factor-header">
                <div className="two-factor-title-section">
                    {isEnabled ? (
                        <ShieldCheck className="two-factor-icon-enabled" />
                    ) : (
                        <ShieldX className="two-factor-icon-disabled" />
                    )}
                    <h3 className="two-factor-title">
                        Verificación en dos pasos
                    </h3>
                </div>
                <span className={`two-factor-status ${isEnabled ? 'two-factor-status-enabled' : 'two-factor-status-disabled'}`}>
                    {isEnabled ? 'Habilitada' : 'Deshabilitada'}
                </span>
            </div>

            <p className="two-factor-description">
                {isEnabled 
                    ? 'La verificación en dos pasos está habilitada. Recibirás un código por correo electrónico cada vez que inicies sesión.'
                    : 'Habilita la verificación en dos pasos para agregar una capa adicional de seguridad a tu cuenta.'
                }
            </p>

            <div className="two-factor-actions">
                {!isEnabled ? (
                    <button
                        onClick={handleEnable2FA}
                        disabled={isUpdating}
                        className="two-factor-btn-enable"
                    >
                        {isUpdating ? (
                            <Loader2 className="two-factor-btn-spinner" />
                        ) : (
                            'Habilitar 2FA'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleDisable2FA}
                        disabled={isUpdating}
                        className="two-factor-btn-disable"
                    >
                        {isUpdating ? (
                            <Loader2 className="two-factor-btn-spinner" />
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