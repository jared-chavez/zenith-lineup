import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const TwoFactorVerificationModal = ({ isOpen, onClose, onSuccess, email }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

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
            const response = await axios.post('/api/auth/2fa/verify', {
                email,
                code: code.trim()
            });

            if (response.data.success) {
                onSuccess(response.data);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al verificar el código';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setError('');

        try {
            await axios.post('/api/auth/2fa/send', { email });
            setTimeLeft(60); // 60 seconds cooldown
        } catch (error) {
            const message = error.response?.data?.message || 'Error al reenviar el código';
            setError(message);
        } finally {
            setIsResending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Verificación en dos pasos
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Hemos enviado un código de verificación a tu correo electrónico.
                    Ingresa el código para continuar.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                            Código de verificación
                        </label>
                        <input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="123456"
                            maxLength="6"
                            autoComplete="one-time-code"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading || !code.trim()}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Verificar'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending || timeLeft > 0}
                            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            ) : timeLeft > 0 ? (
                                `Reenviar en ${timeLeft}s`
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
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