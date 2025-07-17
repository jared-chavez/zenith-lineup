import { useCallback } from 'react';
import useNotificationStore from '../stores/notificationStore';

const useErrorHandler = () => {
    const { error: showError } = useNotificationStore();

    const handleError = useCallback((error, context = '') => {
        console.error(`Error in ${context}:`, error);

        let message = 'Ha ocurrido un error inesperado';
        let title = 'Error';

        // Handle different types of errors
        if (error.response) {
            // Server error response
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 400:
                    title = 'Datos inválidos';
                    message = data.message || 'Los datos proporcionados no son válidos';
                    break;
                case 401:
                    title = 'No autorizado';
                    message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente';
                    break;
                case 403:
                    title = 'Acceso denegado';
                    message = 'No tienes permisos para realizar esta acción';
                    break;
                case 404:
                    title = 'No encontrado';
                    message = 'El recurso solicitado no fue encontrado';
                    break;
                case 422:
                    title = 'Datos inválidos';
                    message = data.message || 'Los datos proporcionados no son válidos';
                    break;
                case 429:
                    title = 'Demasiadas solicitudes';
                    message = 'Has excedido el límite de solicitudes. Intenta nuevamente en unos minutos';
                    break;
                case 500:
                    title = 'Error del servidor';
                    message = 'Ha ocurrido un error en el servidor. Intenta nuevamente más tarde';
                    break;
                default:
                    title = 'Error del servidor';
                    message = data.message || `Error ${status}: Ha ocurrido un problema`;
            }
        } else if (error.request) {
            // Network error
            title = 'Error de conexión';
            message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet';
        } else if (error.message) {
            // JavaScript error
            message = error.message;
        }

        // Show error notification
        showError(message, title, {
            persistent: status === 401, // Keep auth errors visible
            duration: status === 401 ? 0 : 8000
        });

        return { message, title, status: error.response?.status };
    }, [showError]);

    const handleValidationError = useCallback((errors) => {
        if (typeof errors === 'object' && errors !== null) {
            const firstError = Object.values(errors)[0];
            const message = Array.isArray(firstError) ? firstError[0] : firstError;
            showError(message, 'Error de validación');
        } else if (typeof errors === 'string') {
            showError(errors, 'Error de validación');
        }
    }, [showError]);

    return {
        handleError,
        handleValidationError
    };
};

export default useErrorHandler; 