import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const TwoFactorVerificationModal = ({ isOpen, onClose, onSuccess, email }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const { complete2FALogin } = useAuthStore();

    useEffect(() => {
        if (isOpen) {
            setCode('');
            setError('');
            setTimeLeft(0);
        }
    }, [isOpen]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) {
            setError('Por favor ingresa el código de verificación');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await complete2FALogin(email, code.trim());
            
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || 'Error al verificar el código');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al verificar el código';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = useCallback(async () => {
        if (isResending || timeLeft > 0) {
            return;
        }

        setIsResending(true);
        setError('');

        try {
            console.log('Enviando código 2FA para:', email);
            const response = await axios.post('/api/auth/2fa/send', { email });
            console.log('Código 2FA enviado exitosamente:', response.data);
            setTimeLeft(60); // 60 seconds cooldown
        } catch (error) {
            console.error('Error enviando código 2FA:', error.response?.data);
            const message = error.response?.data?.message || 'Error al reenviar el código';
            setError(message);
        } finally {
            setIsResending(false);
        }
    }, [email, isResending, timeLeft]);

    if (!isOpen) return null;

    return (
        <div className="two-factor-modal-overlay">
            <div className="two-factor-modal">
                <div className="two-factor-modal-header">
                    <h2 className="two-factor-modal-title">
                        Verificación en dos pasos
                    </h2>
                    <button
                        onClick={onClose}
                        className="two-factor-modal-close"
                    >
                        <X className="two-factor-modal-close-icon" />
                    </button>
                </div>

                <p className="two-factor-modal-description">
                    Hemos enviado un código de verificación a tu correo electrónico.
                    Ingresa el código para continuar.
                </p>

                {error && (
                    <div className="two-factor-modal-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="two-factor-modal-form">
                    <div className="two-factor-modal-field">
                        <label htmlFor="code" className="two-factor-modal-label">
                            Código de verificación
                        </label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="two-factor-modal-input"
                            placeholder="123456"
                            maxLength="6"
                            autoComplete="one-time-code"
                            autoFocus
                        />
                    </div>

                    <div className="two-factor-modal-actions">
                        <button
                            type="submit"
                            disabled={isLoading || !code.trim()}
                            className="two-factor-modal-btn two-factor-modal-btn-primary"
                        >
                            {isLoading ? (
                                <Loader2 className="two-factor-modal-spinner" />
                            ) : (
                                'Verificar'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending || timeLeft > 0}
                            className="two-factor-modal-btn two-factor-modal-btn-secondary"
                        >
                            {isResending ? (
                                <Loader2 className="two-factor-modal-spinner two-factor-modal-spinner-small" />
                            ) : timeLeft > 0 ? (
                                `Reenviar en ${timeLeft}s`
                            ) : (
                                <>
                                    <RefreshCw className="two-factor-modal-icon" />
                                    Reenviar código
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TwoFactorVerificationModal; 