import React, { useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Logs from './pages/Logs';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const { isAuthenticated, isInitialized, initialize } = useAuthStore();

    useEffect(() => {
        // Initialize auth state when app loads
        initialize();
    }, [initialize]);

    // Show loading while initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Public routes */}
                    <Route 
                        path="/login" 
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
                    />
                    <Route 
                        path="/register" 
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
                    />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="habits" element={<Habits />} />
                        <Route path="logs" element={<Logs />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App; 