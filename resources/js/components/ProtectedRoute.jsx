import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 