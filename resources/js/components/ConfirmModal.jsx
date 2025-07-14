import React from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirmar acción',
    message = '¿Estás seguro de que quieres realizar esta acción?',
    type = 'warning', // 'warning', 'danger', 'info'
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertCircle className="confirm-modal-icon confirm-modal-icon-danger" />;
            case 'info':
                return <Info className="confirm-modal-icon confirm-modal-icon-info" />;
            default:
                return <AlertTriangle className="confirm-modal-icon confirm-modal-icon-warning" />;
        }
    };

    const getModalClasses = () => {
        const baseClasses = 'confirm-modal confirm-modal-base';
        const typeClasses = {
            warning: 'confirm-modal-warning',
            danger: 'confirm-modal-danger',
            info: 'confirm-modal-info'
        };
        
        return `${baseClasses} ${typeClasses[type] || typeClasses.warning}`;
    };

    const getButtonClasses = () => {
        const baseClasses = 'confirm-modal-button confirm-modal-button-base';
        const typeClasses = {
            warning: 'confirm-modal-button-warning',
            danger: 'confirm-modal-button-danger',
            info: 'confirm-modal-button-info'
        };
        
        return `${baseClasses} ${typeClasses[type] || typeClasses.warning}`;
    };

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={handleClose}>
            <div 
                className={getModalClasses()}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-message"
            >
                <div className="confirm-modal-header">
                    <div className="confirm-modal-icon-wrapper">
                        {getIcon()}
                    </div>
                    <h2 id="confirm-modal-title" className="confirm-modal-title">
                        {title}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="confirm-modal-close"
                        aria-label="Cerrar modal"
                        disabled={isLoading}
                        type="button"
                    >
                        <X className="confirm-modal-close-icon" />
                    </button>
                </div>

                <div className="confirm-modal-body">
                    <p id="confirm-modal-message" className="confirm-modal-message">
                        {message}
                    </p>
                </div>

                <div className="confirm-modal-footer">
                    <button
                        onClick={handleClose}
                        className="confirm-modal-button confirm-modal-button-cancel"
                        disabled={isLoading}
                        type="button"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={getButtonClasses()}
                        disabled={isLoading}
                        type="button"
                    >
                        {isLoading ? (
                            <div className="confirm-modal-loading">
                                <div className="confirm-modal-spinner" />
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal; 