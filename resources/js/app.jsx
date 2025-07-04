import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const { isAuthenticated } = useAuthStore();

    return (
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
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </div>
    );
}

export default App; 