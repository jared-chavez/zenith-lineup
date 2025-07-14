import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    maxNotifications: 5,

    // Add a new notification
    addNotification: (notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: 'info', // 'success', 'error', 'warning', 'info'
            title: '',
            message: '',
            duration: 5000, // Auto-dismiss after 5 seconds
            persistent: false, // If true, won't auto-dismiss
            ...notification
        };

        set((state) => ({
            notifications: [
                newNotification,
                ...state.notifications.slice(0, state.maxNotifications - 1)
            ]
        }));

        // Auto-dismiss if not persistent
        if (!newNotification.persistent && newNotification.duration > 0) {
            setTimeout(() => {
                get().removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    },

    // Remove a specific notification
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter(notification => notification.id !== id)
        }));
    },

    // Clear all notifications
    clearNotifications: () => {
        set({ notifications: [] });
    },

    // Convenience methods for different notification types
    success: (message, title = 'Éxito', options = {}) => {
        return get().addNotification({
            type: 'success',
            title,
            message,
            ...options
        });
    },

    error: (message, title = 'Error', options = {}) => {
        return get().addNotification({
            type: 'error',
            title,
            message,
            duration: 8000, // Errors stay longer
            ...options
        });
    },

    warning: (message, title = 'Advertencia', options = {}) => {
        return get().addNotification({
            type: 'warning',
            title,
            message,
            duration: 6000,
            ...options
        });
    },

    info: (message, title = 'Información', options = {}) => {
        return get().addNotification({
            type: 'info',
            title,
            message,
            ...options
        });
    },

    // Show loading notification (persistent until manually dismissed)
    loading: (message, title = 'Cargando...', options = {}) => {
        return get().addNotification({
            type: 'loading',
            title,
            message,
            persistent: true,
            ...options
        });
    },

    // Update a loading notification to success/error
    updateNotification: (id, updates) => {
        set((state) => ({
            notifications: state.notifications.map(notification =>
                notification.id === id
                    ? { ...notification, ...updates }
                    : notification
            )
        }));
    }
}));

export default useNotificationStore; 