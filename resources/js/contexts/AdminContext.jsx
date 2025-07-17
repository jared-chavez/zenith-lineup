import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useAdminStore from '../stores/adminStore';
import { useAdminStats } from '../hooks/useAdminAPI';
import useNotificationStore from '../stores/notificationStore';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, token } = useAuthStore();
    const { setStats, setUI, ui } = useAdminStore();
    const { fetchStats } = useAdminStats();
    const { error } = useNotificationStore();
    
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Check if user is admin
    useEffect(() => {
        if (isAuthenticated && user) {
            const adminStatus = user.role === 'admin';
            setIsAdmin(adminStatus);
            
            if (!adminStatus) {
                error('Acceso denegado. Se requieren privilegios de administrador.');
                navigate('/dashboard');
            }
        } else if (isAuthenticated === false) {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate, error]);

    // Initialize admin dashboard
    useEffect(() => {
        if (isAdmin && token && !isInitialized) {
            initializeAdminDashboard();
        }
    }, [isAdmin, token, isInitialized]);

    // Auto-refresh stats
    useEffect(() => {
        if (!isAdmin || !ui.refreshInterval) return;

        const interval = setInterval(() => {
            refreshStats();
        }, ui.refreshInterval);

        return () => clearInterval(interval);
    }, [isAdmin, ui.refreshInterval]);

    const initializeAdminDashboard = async () => {
        try {
            setIsLoading(true);
            await refreshStats();
            setUI({ lastRefresh: new Date().toISOString() });
            setIsInitialized(true);
        } catch (err) {
            console.error('Error initializing admin dashboard:', err);
            error('Error al inicializar el dashboard de administración');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshStats = async () => {
        try {
            const stats = await fetchStats();
            setStats(stats);
            setUI({ lastRefresh: new Date().toISOString() });
        } catch (err) {
            console.error('Error refreshing stats:', err);
            // Don't show error notification for auto-refresh failures
        }
    };

    const setRefreshInterval = (interval) => {
        setUI({ refreshInterval: interval });
    };

    const toggleSidebar = () => {
        setUI({ sidebarCollapsed: !ui.sidebarCollapsed });
    };

    const setActiveTab = (tab) => {
        setUI({ activeTab: tab });
    };

    const value = {
        isAdmin,
        isLoading,
        isInitialized,
        refreshStats,
        setRefreshInterval,
        toggleSidebar,
        setActiveTab,
        lastRefresh: ui.lastRefresh,
        sidebarCollapsed: ui.sidebarCollapsed,
        activeTab: ui.activeTab,
        refreshInterval: ui.refreshInterval
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContext; 