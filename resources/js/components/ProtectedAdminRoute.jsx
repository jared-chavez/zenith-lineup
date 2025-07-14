import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ProtectedAdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedAdminRoute; 