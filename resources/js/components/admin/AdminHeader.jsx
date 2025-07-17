import React, { useState } from 'react';
import { Bell, RefreshCw, User, Settings } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

const AdminHeader = () => {
    const { user } = useAuthStore();
    const { refreshStats, lastRefresh, refreshInterval } = useAdmin();
    const { notifications } = useNotificationStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshStats();
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatLastRefresh = () => {
        if (!lastRefresh) return 'Nunca';
        
        const now = new Date();
        const refreshTime = new Date(lastRefresh);
        const diffInSeconds = Math.floor((now - refreshTime) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
        return `Hace ${Math.floor(diffInSeconds / 86400)}d`;
    };

    const formatRefreshInterval = () => {
        if (!refreshInterval) return 'Manual';
        const minutes = Math.floor(refreshInterval / 60000);
        return `${minutes}m`;
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side */}
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Panel de Administración
                        </h1>
                        
                        {/* Refresh controls */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Actualización: {formatRefreshInterval()}</span>
                            <span>•</span>
                            <span>Última: {formatLastRefresh()}</span>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                                title="Actualizar datos"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                <Bell className="h-5 w-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Settings */}
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                            <Settings className="h-5 w-5" />
                        </button>

                        {/* User menu */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name || 'Administrador'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email || 'admin@zenithlineup.com'}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader; 