import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import useAuthStore from '../stores/authStore';
import useNotificationStore from '../stores/notificationStore';

// Base admin API hook
export const useAdminAPI = () => {
    const { token } = useAuthStore();
    const { success, error } = useNotificationStore();
    const [loading, setLoading] = useState(false);

    const adminAPI = useMemo(() => {
        if (!token) {
            return null;
        }
        
        const api = axios.create({
            baseURL: '/api/admin',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return api;
    }, [token]);

    // Helper function to make authenticated admin requests
    const makeAdminRequest = useCallback(async (method, endpoint, data = null) => {
        setLoading(true);
        try {
            const response = await adminAPI({
                method,
                url: endpoint,
                data,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error en la operación';
            error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, error, adminAPI]);

    return { makeAdminRequest, loading };
};

// Admin Stats Hook
export const useAdminStats = () => {
    const { makeAdminRequest, loading } = useAdminAPI();
    const { success } = useNotificationStore();

    const fetchStats = useCallback(async () => {
        try {
            const data = await makeAdminRequest('GET', '/stats');
            success('Estadísticas actualizadas correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    const fetchUserAnalytics = useCallback(async (period = 30) => {
        try {
            const data = await makeAdminRequest('GET', `/stats/user-analytics?period=${period}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchHabitAnalytics = useCallback(async () => {
        try {
            const data = await makeAdminRequest('GET', '/stats/habit-analytics');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchPerformanceMetrics = useCallback(async () => {
        try {
            const data = await makeAdminRequest('GET', '/stats/performance');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    return {
        fetchStats,
        fetchUserAnalytics,
        fetchHabitAnalytics,
        fetchPerformanceMetrics,
        loading
    };
};

// Admin Users Hook
export const useAdminUsers = () => {
    const { makeAdminRequest, loading } = useAdminAPI();
    const { success } = useNotificationStore();

    const fetchUsers = useCallback(async (page = 1, perPage = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page,
                per_page: perPage,
                ...filters
            });
            const data = await makeAdminRequest('GET', `/users?${params}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchUser = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('GET', `/users/${id}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const updateUser = useCallback(async (id, userData) => {
        try {
            const data = await makeAdminRequest('PUT', `/users/${id}`, userData);
            success('Usuario actualizado correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    const deleteUser = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('DELETE', `/users/${id}`);
            success('Usuario eliminado correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    const bulkAction = useCallback(async (action, userIds) => {
        try {
            const data = await makeAdminRequest('POST', '/users/bulk-action', {
                action,
                user_ids: userIds
            });
            success(`Acción ${action} aplicada correctamente`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    const exportUsers = useCallback(async (format = 'csv') => {
        try {
            const data = await makeAdminRequest('POST', '/users/export', { format });
            success('Exportación iniciada correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    return {
        fetchUsers,
        fetchUser,
        updateUser,
        deleteUser,
        bulkAction,
        exportUsers,
        loading
    };
};

// Admin Habits Hook
export const useAdminHabits = () => {
    const { makeAdminRequest, loading } = useAdminAPI();
    const { success } = useNotificationStore();

    const fetchHabits = useCallback(async (page = 1, perPage = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page,
                per_page: perPage,
                ...filters
            });
            const data = await makeAdminRequest('GET', `/habits?${params}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchHabit = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('GET', `/habits/${id}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const updateHabit = useCallback(async (id, habitData) => {
        try {
            const data = await makeAdminRequest('PUT', `/habits/${id}`, habitData);
            success('Hábito actualizado correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    const deleteHabit = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('DELETE', `/habits/${id}`);
            success('Hábito eliminado correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    return {
        fetchHabits,
        fetchHabit,
        updateHabit,
        deleteHabit,
        loading
    };
};

// Admin Logs Hook
export const useAdminLogs = () => {
    const { makeAdminRequest, loading } = useAdminAPI();
    const { success } = useNotificationStore();

    const fetchLogs = useCallback(async (page = 1, perPage = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page,
                per_page: perPage,
                ...filters
            });
            const data = await makeAdminRequest('GET', `/logs?${params}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchLog = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('GET', `/logs/${id}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const updateLog = useCallback(async (id, logData) => {
        try {
            const data = await makeAdminRequest('PUT', `/logs/${id}`, logData);
            success('Registro actualizado correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    const deleteLog = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('DELETE', `/logs/${id}`);
            success('Registro eliminado correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    return {
        fetchLogs,
        fetchLog,
        updateLog,
        deleteLog,
        loading
    };
};

// Admin Audit Logs Hook
export const useAdminAuditLogs = () => {
    const { makeAdminRequest, loading } = useAdminAPI();
    const { success } = useNotificationStore();

    const fetchAuditLogs = useCallback(async (page = 1, perPage = 10, filters = {}) => {
        try {
            const params = new URLSearchParams({
                page,
                per_page: perPage,
                ...filters
            });
            const data = await makeAdminRequest('GET', `/audit-logs?${params}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchAuditLog = useCallback(async (id) => {
        try {
            const data = await makeAdminRequest('GET', `/audit-logs/${id}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchModelLogs = useCallback(async (modelType, modelId) => {
        try {
            const data = await makeAdminRequest('GET', `/audit-logs/model/${modelType}/${modelId}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchUserLogs = useCallback(async (userId) => {
        try {
            const data = await makeAdminRequest('GET', `/audit-logs/user/${userId}`);
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const fetchAuditStatistics = useCallback(async () => {
        try {
            const data = await makeAdminRequest('GET', '/audit-logs/statistics');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest]);

    const exportAuditLogs = useCallback(async (format = 'csv', filters = {}) => {
        try {
            const data = await makeAdminRequest('POST', '/audit-logs/export', { format, ...filters });
            success('Exportación de logs iniciada correctamente');
            return data;
        } catch (err) {
            throw err;
        }
    }, [makeAdminRequest, success]);

    return {
        fetchAuditLogs,
        fetchAuditLog,
        fetchModelLogs,
        fetchUserLogs,
        fetchAuditStatistics,
        exportAuditLogs,
        loading
    };
}; 