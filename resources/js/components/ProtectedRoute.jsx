import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isInitialized, checkAuth, initialize, isLoading, user } = useAuthStore();

    useEffect(() => {
        // Initialize auth state first
        if (!isInitialized) {
            initialize();
        }
        
        // Then check auth status
        if (isInitialized && !isAuthenticated) {
            checkAuth();
        }
    }, [isInitialized, isAuthenticated, initialize, checkAuth]);

    // Show loading while initializing or checking auth
    if (isLoading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si el usuario es admin, redirigir a /admin
    if (user && user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute; 