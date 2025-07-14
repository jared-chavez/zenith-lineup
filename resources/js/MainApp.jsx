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
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import NotificationContainer from './components/NotificationContainer';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

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
                {/* Global Notification Container */}
                <NotificationContainer />
                
                <Routes>
                    {/* Home route: si no autenticado muestra Home, si autenticado redirige a dashboard */}
                    <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />

                    {/* Public routes */}
                    <Route 
                        path="/login" 
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
                    />
                    <Route 
                        path="/register" 
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
                    />

                    {/* Legal pages */}
                    <Route path="/terminos" element={<Terms />} />
                    <Route path="/privacidad" element={<Privacy />} />

                    {/* Protected routes (solo rutas internas) */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="habits" element={<Habits />} />
                        <Route path="logs" element={<Logs />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Admin routes */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedAdminRoute>
                                <AdminDashboard />
                            </ProtectedAdminRoute>
                        } 
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App; 