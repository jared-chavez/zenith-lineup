import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';

const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotificationStore();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="notification-icon notification-icon-success" />;
            case 'error':
                return <AlertCircle className="notification-icon notification-icon-error" />;
            case 'warning':
                return <AlertTriangle className="notification-icon notification-icon-warning" />;
            case 'loading':
                return <Loader2 className="notification-icon notification-icon-loading animate-spin" />;
            default:
                return <Info className="notification-icon notification-icon-info" />;
        }
    };

    const getNotificationClasses = (type) => {
        const baseClasses = 'notification-toast notification-toast-base';
        const typeClasses = {
            success: 'notification-toast-success',
            error: 'notification-toast-error',
            warning: 'notification-toast-warning',
            info: 'notification-toast-info',
            loading: 'notification-toast-loading'
        };
        
        return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="notification-container">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={getNotificationClasses(notification.type)}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="notification-content">
                        <div className="notification-icon-wrapper">
                            {getIcon(notification.type)}
                        </div>
                        
                        <div className="notification-text">
                            {notification.title && (
                                <h4 className="notification-title">
                                    {notification.title}
                                </h4>
                            )}
                            {notification.message && (
                                <p className="notification-message">
                                    {notification.message}
                                </p>
                            )}
                        </div>
                        
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="notification-close"
                            aria-label="Cerrar notificación"
                            type="button"
                        >
                            <X className="notification-close-icon" />
                        </button>
                    </div>
                    
                    {/* Progress bar for auto-dismiss */}
                    {!notification.persistent && notification.duration > 0 && (
                        <div className="notification-progress">
                            <div 
                                className="notification-progress-bar"
                                style={{
                                    animationDuration: `${notification.duration}ms`
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer; 